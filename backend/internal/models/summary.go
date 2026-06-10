package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ActivationSummary struct {
	ID        primitive.ObjectID `json:"_id"`
	Name      string             `json:"name"`
	City      string             `json:"city"`
	SetupDone bool               `json:"setupDone"`
	IsCurrent bool               `json:"isCurrent"`
	Progress  int                `json:"progress"`
	UpdatedAt time.Time          `json:"updatedAt"`
}

func ProgressPct(milestones map[string]MilestoneState) int {
	if len(milestones) == 0 {
		return 0
	}
	done := 0
	for _, m := range milestones {
		if m.Status == "done" {
			done++
		}
	}
	return (done * 100) / len(milestones)
}

func ToSummary(a Activation) ActivationSummary {
	return ActivationSummary{
		ID:        a.ID,
		Name:      a.Info.Name,
		City:      a.Info.City,
		SetupDone: a.SetupDone,
		IsCurrent: a.IsCurrent,
		Progress:  ProgressPct(a.Milestones),
		UpdatedAt: a.UpdatedAt,
	}
}
