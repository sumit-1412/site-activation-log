package auth

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"net/http"
	"strings"
	"sync"
)

var ErrInvalidCredentials = errors.New("invalid email or password")

type User struct {
	Email    string `json:"email"`
	Name     string `json:"name,omitempty"`
	Picture  string `json:"picture,omitempty"`
	Provider string `json:"provider,omitempty"`
}

type Options struct {
	AdminEmail       string
	AdminPassword    string
	GoogleClientID   string
	AllowedDomains   []string
}

type Manager struct {
	adminEmail     string
	adminPassword  string
	googleClientID string
	allowedDomains []string
	tokens         map[string]User
	mu             sync.RWMutex
}

func New(opts Options) *Manager {
	return &Manager{
		adminEmail:     opts.AdminEmail,
		adminPassword:  opts.AdminPassword,
		googleClientID: opts.GoogleClientID,
		allowedDomains: opts.AllowedDomains,
		tokens:         make(map[string]User),
	}
}

func (m *Manager) Enabled() bool {
	return m.googleClientID != "" || (m.adminEmail != "" && m.adminPassword != "")
}

func (m *Manager) GoogleEnabled() bool {
	return m.googleClientID != ""
}

func (m *Manager) PasswordEnabled() bool {
	return m.adminEmail != "" && m.adminPassword != ""
}

func (m *Manager) GoogleClientID() string {
	return m.googleClientID
}

func (m *Manager) issueToken(user User) (string, error) {
	token, err := newToken()
	if err != nil {
		return "", err
	}
	m.mu.Lock()
	m.tokens[token] = user
	m.mu.Unlock()
	return token, nil
}

func (m *Manager) Login(email, password string) (string, User, error) {
	if !m.PasswordEnabled() {
		return "", User{}, ErrInvalidCredentials
	}
	if email != m.adminEmail || password != m.adminPassword {
		return "", User{}, ErrInvalidCredentials
	}

	user := User{Email: email, Name: nameFromEmail(email), Provider: "password"}
	token, err := m.issueToken(user)
	if err != nil {
		return "", User{}, err
	}
	return token, user, nil
}

func (m *Manager) LoginGoogle(user User) (string, error) {
	token, err := m.issueToken(user)
	if err != nil {
		return "", err
	}
	return token, nil
}

func (m *Manager) Logout(token string) {
	m.mu.Lock()
	delete(m.tokens, token)
	m.mu.Unlock()
}

func (m *Manager) UserFromToken(token string) (User, bool) {
	m.mu.RLock()
	user, ok := m.tokens[token]
	m.mu.RUnlock()
	return user, ok
}

func (m *Manager) AllowedDomains() []string {
	return m.allowedDomains
}

func (m *Manager) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !m.Enabled() {
			next.ServeHTTP(w, r)
			return
		}

		token := bearerToken(r.Header.Get("Authorization"))
		if token == "" {
			writeUnauthorized(w)
			return
		}
		if _, ok := m.UserFromToken(token); !ok {
			writeUnauthorized(w)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func bearerToken(header string) string {
	const prefix = "Bearer "
	if !strings.HasPrefix(header, prefix) {
		return ""
	}
	return strings.TrimSpace(header[len(prefix):])
}

func writeUnauthorized(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusUnauthorized)
	_, _ = w.Write([]byte(`{"error":"unauthorized"}`))
}

func nameFromEmail(email string) string {
	local, _, ok := strings.Cut(email, "@")
	if !ok || local == "" {
		return ""
	}
	parts := strings.FieldsFunc(local, func(r rune) bool {
		return r == '.' || r == '_' || r == '-'
	})
	for i, p := range parts {
		if p == "" {
			continue
		}
		if len(p) == 1 {
			parts[i] = strings.ToUpper(p)
		} else {
			parts[i] = strings.ToUpper(p[:1]) + strings.ToLower(p[1:])
		}
	}
	return strings.Join(parts, " ")
}

func newToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}
