package handlers

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/humblx/site-activation-log/internal/auth"
)

type Auth struct {
	Sessions *auth.Manager
}

func (h *Auth) Status(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]bool{
		"required": h.Sessions.Enabled(),
		"google":   h.Sessions.GoogleEnabled(),
		"password": h.Sessions.PasswordEnabled(),
	})
}

func (h *Auth) Me(w http.ResponseWriter, r *http.Request) {
	token := bearerFromRequest(r)
	if token == "" {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}
	user, ok := h.Sessions.UserFromToken(token)
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}
	writeJSON(w, http.StatusOK, user)
}

func (h *Auth) Login(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}

	token, user, err := h.Sessions.Login(body.Email, body.Password)
	if err != nil {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "invalid email or password"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"token": token,
		"user":  user,
	})
}

func (h *Auth) GoogleLogin(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Credential string `json:"credential"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}

	user, err := h.Sessions.VerifyGoogleCredential(r.Context(), body.Credential)
	if err != nil {
		msg := "google sign-in failed"
		if errors.Is(err, auth.ErrGoogleNotConfigured) {
			msg = "google sign-in is not configured on the server"
		} else if errors.Is(err, auth.ErrEmailNotAllowed) {
			msg = "this google account is not allowed"
		}
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": msg})
		return
	}

	token, err := h.Sessions.LoginGoogle(user)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "could not create session"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"token": token,
		"user":  user,
	})
}

func (h *Auth) Logout(w http.ResponseWriter, r *http.Request) {
	token := bearerFromRequest(r)
	if token != "" {
		h.Sessions.Logout(token)
	}
	w.WriteHeader(http.StatusNoContent)
}

func bearerFromRequest(r *http.Request) string {
	const prefix = "Bearer "
	header := r.Header.Get("Authorization")
	if len(header) < len(prefix) || header[:len(prefix)] != prefix {
		return ""
	}
	return header[len(prefix):]
}
