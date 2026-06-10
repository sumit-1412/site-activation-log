package config

import (
	"os"
	"strings"
)

type Config struct {
	Port               string
	MongoURI           string
	MongoDB            string
	AllowedOrigins     []string
	AdminEmail         string
	AdminPassword      string
	GoogleClientID     string
	AllowedEmailDomains []string
}

func Load() Config {
	origins := os.Getenv("CORS_ORIGINS")
	if origins == "" {
		origins = "http://localhost:5173,http://127.0.0.1:5173"
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	db := os.Getenv("MONGODB_DB")
	if db == "" {
		db = "humblx_activation"
	}

	uri := os.Getenv("MONGODB_URI")
	if uri == "" {
		uri = "mongodb://localhost:27017"
	}

	domains := os.Getenv("ALLOWED_EMAIL_DOMAINS")
	var allowedDomains []string
	if domains != "" {
		for _, d := range strings.Split(domains, ",") {
			if trimmed := strings.TrimSpace(d); trimmed != "" {
				allowedDomains = append(allowedDomains, trimmed)
			}
		}
	}

	return Config{
		Port:                port,
		MongoURI:            uri,
		MongoDB:             db,
		AllowedOrigins:      strings.Split(origins, ","),
		AdminEmail:          os.Getenv("ADMIN_EMAIL"),
		AdminPassword:       os.Getenv("ADMIN_PASSWORD"),
		GoogleClientID:      os.Getenv("GOOGLE_CLIENT_ID"),
		AllowedEmailDomains: allowedDomains,
	}
}
