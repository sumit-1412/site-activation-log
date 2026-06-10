package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type MilestoneState struct {
	Status string  `json:"status" bson:"status"`
	Date   *string `json:"date" bson:"date,omitempty"`
	Note   string  `json:"note" bson:"note"`
	SentAt *string `json:"sentAt" bson:"sentAt,omitempty"`
}

type DocState struct {
	Status       string  `json:"status" bson:"status"`
	SentDate     *string `json:"sentDate" bson:"sentDate,omitempty"`
	ReceivedDate *string `json:"receivedDate" bson:"receivedDate,omitempty"`
	ApprovedDate *string `json:"approvedDate" bson:"approvedDate,omitempty"`
	Link         string  `json:"link" bson:"link"`
}

type HospitalInfo struct {
	Name       string      `json:"name" bson:"name"`
	City       string      `json:"city" bson:"city"`
	Beds       interface{} `json:"beds" bson:"beds"`
	Modules    []string    `json:"modules" bson:"modules"`
	Type       string      `json:"type" bson:"type"`
	Poc        string      `json:"poc" bson:"poc"`
	StartDate  string      `json:"startDate" bson:"startDate"`
	GoliveDate string      `json:"goliveDate" bson:"goliveDate"`
}

type Poc struct {
	Name  string `json:"name" bson:"name"`
	Role  string `json:"role" bson:"role"`
	Phone string `json:"phone" bson:"phone"`
	Email string `json:"email" bson:"email"`
}

type Visit struct {
	ID         string   `json:"id" bson:"id"`
	Date       string   `json:"date" bson:"date"`
	Type       string   `json:"type" bson:"type"`
	Team       []string `json:"team" bson:"team"`
	ClientMet  string   `json:"clientMet" bson:"clientMet"`
	Outcome    string   `json:"outcome" bson:"outcome"`
	NextAction string   `json:"nextAction" bson:"nextAction"`
	NextOwner  string   `json:"nextOwner" bson:"nextOwner"`
	NextDate   string   `json:"nextDate" bson:"nextDate"`
}

type NudgeLog struct {
	Sender string `json:"sender" bson:"sender"`
	Time   string `json:"time" bson:"time"`
	To     string `json:"to" bson:"to"`
}

type ActivityEntry struct {
	T   string `json:"t" bson:"t"`
	Txt string `json:"txt" bson:"txt"`
}

// Activation matches the React ActivationDocument / ActivationState shape.
type Activation struct {
	ID         primitive.ObjectID        `json:"_id,omitempty" bson:"_id,omitempty"`
	SetupDone  bool                      `json:"setupDone" bson:"setupDone"`
	Info       HospitalInfo              `json:"info" bson:"info"`
	Milestones map[string]MilestoneState `json:"milestones" bson:"milestones"`
	Docs       map[string]DocState       `json:"docs" bson:"docs"`
	Visits     []Visit                   `json:"visits" bson:"visits"`
	Pocs       []Poc                     `json:"pocs" bson:"pocs"`
	Staff      []interface{}             `json:"staff" bson:"staff"`
	NudgeLogs  []NudgeLog                `json:"nudgeLogs" bson:"nudgeLogs"`
	Activity   []ActivityEntry           `json:"activity" bson:"activity"`
	IsCurrent  bool                      `json:"-" bson:"isCurrent"`
	CreatedAt  time.Time                 `json:"createdAt,omitempty" bson:"createdAt"`
	UpdatedAt  time.Time                 `json:"updatedAt,omitempty" bson:"updatedAt"`
}

// ActivationInput is the request body (no server-managed fields).
type ActivationInput struct {
	SetupDone  bool                      `json:"setupDone"`
	Info       HospitalInfo              `json:"info"`
	Milestones map[string]MilestoneState `json:"milestones"`
	Docs       map[string]DocState       `json:"docs"`
	Visits     []Visit                   `json:"visits"`
	Pocs       []Poc                     `json:"pocs"`
	Staff      []interface{}             `json:"staff"`
	NudgeLogs  []NudgeLog                `json:"nudgeLogs"`
	Activity   []ActivityEntry           `json:"activity"`
}

func (in ActivationInput) ApplyTo(a *Activation) {
	a.SetupDone = in.SetupDone
	a.Info = in.Info
	a.Milestones = in.Milestones
	a.Docs = in.Docs
	a.Visits = in.Visits
	a.Pocs = in.Pocs
	a.Staff = in.Staff
	a.NudgeLogs = in.NudgeLogs
	a.Activity = in.Activity
}

func EmptySlices(a *Activation) {
	if a.Milestones == nil {
		a.Milestones = map[string]MilestoneState{}
	}
	if a.Docs == nil {
		a.Docs = map[string]DocState{}
	}
	if a.Visits == nil {
		a.Visits = []Visit{}
	}
	if a.Pocs == nil {
		a.Pocs = []Poc{}
	}
	if a.Staff == nil {
		a.Staff = []interface{}{}
	}
	if a.NudgeLogs == nil {
		a.NudgeLogs = []NudgeLog{}
	}
	if a.Activity == nil {
		a.Activity = []ActivityEntry{}
	}
	if a.Info.Modules == nil {
		a.Info.Modules = []string{}
	}
}
