package auth

import (
	"context"
	"errors"
	"strings"

	"google.golang.org/api/idtoken"
)

var ErrGoogleNotConfigured = errors.New("google sign-in is not configured")
var ErrEmailNotAllowed = errors.New("this email domain is not allowed")

func (m *Manager) VerifyGoogleCredential(ctx context.Context, credential string) (User, error) {
	if !m.GoogleEnabled() {
		return User{}, ErrGoogleNotConfigured
	}
	if credential == "" {
		return User{}, errors.New("missing google credential")
	}

	payload, err := idtoken.Validate(ctx, credential, m.googleClientID)
	if err != nil {
		return User{}, err
	}

	email, _ := payload.Claims["email"].(string)
	if email == "" {
		return User{}, errors.New("email missing from google token")
	}

	verified, _ := payload.Claims["email_verified"].(bool)
	if !verified {
		return User{}, errors.New("google email is not verified")
	}

	if len(m.allowedDomains) > 0 {
		domain := strings.ToLower(email[strings.LastIndex(email, "@")+1:])
		allowed := false
		for _, d := range m.allowedDomains {
			if domain == strings.ToLower(strings.TrimSpace(d)) {
				allowed = true
				break
			}
		}
		if !allowed {
			return User{}, ErrEmailNotAllowed
		}
	}

	name, _ := payload.Claims["name"].(string)
	picture, _ := payload.Claims["picture"].(string)

	return User{
		Email:    email,
		Name:     name,
		Picture:  picture,
		Provider: "google",
	}, nil
}
