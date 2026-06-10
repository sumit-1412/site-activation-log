package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/humblx/site-activation-log/internal/store"
)

type Health struct {
	Store *store.Store
}

func (h *Health) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	if err := h.Store.Ping(ctx); err != nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{
			"status":  "error",
			"mongodb": "disconnected",
			"error":   err.Error(),
		})
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"status":  "ok",
		"mongodb": "connected",
	})
}
