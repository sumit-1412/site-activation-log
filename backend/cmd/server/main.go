package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/joho/godotenv"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/humblx/site-activation-log/internal/auth"
	"github.com/humblx/site-activation-log/internal/config"
	"github.com/humblx/site-activation-log/internal/handlers"
	"github.com/humblx/site-activation-log/internal/store"
)

func loadEnv() {
	// Try common locations so `go run` works from backend/ or project root.
	for _, path := range []string{".env", "backend/.env", "../backend/.env"} {
		if err := godotenv.Load(path); err == nil {
			log.Printf("loaded env from %s", path)
			return
		}
	}
	log.Println("no .env file found — using defaults (mongodb://localhost:27017). Copy backend/.env.example to backend/.env")
}

func main() {
	loadEnv()

	cfg := config.Load()

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	st, err := store.New(ctx, cfg.MongoURI, cfg.MongoDB)
	if err != nil {
		log.Fatalf("mongodb: not connected — %v", err)
	}
	log.Printf("mongodb connected (database: %s)", cfg.MongoDB)
	defer func() {
		shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer shutdownCancel()
		_ = st.Close(shutdownCtx)
	}()

	sessions := auth.New(auth.Options{
		AdminEmail:     cfg.AdminEmail,
		AdminPassword:  cfg.AdminPassword,
		GoogleClientID: cfg.GoogleClientID,
		AllowedDomains: cfg.AllowedEmailDomains,
	})
	switch {
	case sessions.GoogleEnabled():
		log.Printf("auth enabled — google sign-in (client id configured)")
	case sessions.PasswordEnabled():
		log.Printf("auth enabled — password login for %s", cfg.AdminEmail)
	default:
		log.Println("auth disabled — set GOOGLE_CLIENT_ID or ADMIN_EMAIL/ADMIN_PASSWORD in .env")
	}

	activations := &handlers.Activations{Store: st}
	health := &handlers.Health{Store: st}
	authHandler := &handlers.Auth{Sessions: sessions}

	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   cfg.AllowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	r.Get("/api/health", health.ServeHTTP)
	r.Route("/api/auth", func(r chi.Router) {
		r.Get("/status", authHandler.Status)
		r.Post("/login", authHandler.Login)
		r.Post("/google", authHandler.GoogleLogin)
		r.Post("/logout", authHandler.Logout)
		r.Get("/me", authHandler.Me)
	})
	r.Route("/api/activations", func(r chi.Router) {
		r.Use(sessions.Middleware)
		activations.Routes(r)
	})

	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		log.Printf("server listening on http://localhost:%s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("shutting down...")
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("shutdown: %v", err)
	}
}
