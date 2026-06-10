package store

import (
	"context"
	"errors"
	"time"

	"github.com/humblx/site-activation-log/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var ErrNotFound = errors.New("activation not found")

type Store struct {
	client *mongo.Client
	db     *mongo.Database
	coll   *mongo.Collection
}

func New(ctx context.Context, uri, dbName string) (*Store, error) {
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		return nil, err
	}
	if err := client.Ping(ctx, nil); err != nil {
		return nil, err
	}

	db := client.Database(dbName)
	coll := db.Collection("activations")

	_, _ = coll.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "isCurrent", Value: 1}},
		Options: options.Index().SetUnique(true).SetPartialFilterExpression(bson.M{"isCurrent": true}),
	})

	return &Store{client: client, db: db, coll: coll}, nil
}

func (s *Store) Close(ctx context.Context) error {
	return s.client.Disconnect(ctx)
}

func (s *Store) Ping(ctx context.Context) error {
	return s.client.Ping(ctx, nil)
}

func (s *Store) GetCurrent(ctx context.Context) (*models.Activation, error) {
	var doc models.Activation
	err := s.coll.FindOne(ctx, bson.M{"isCurrent": true}).Decode(&doc)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	models.EmptySlices(&doc)
	return &doc, nil
}

func (s *Store) GetByID(ctx context.Context, id primitive.ObjectID) (*models.Activation, error) {
	var doc models.Activation
	err := s.coll.FindOne(ctx, bson.M{"_id": id}).Decode(&doc)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	models.EmptySlices(&doc)
	return &doc, nil
}

func (s *Store) SaveCurrent(ctx context.Context, input models.ActivationInput) (*models.Activation, error) {
	now := time.Now().UTC()
	existing, err := s.GetCurrent(ctx)
	if errors.Is(err, ErrNotFound) {
		doc := models.Activation{
			SetupDone:  input.SetupDone,
			Info:       input.Info,
			Milestones: input.Milestones,
			Docs:       input.Docs,
			Visits:     input.Visits,
			Pocs:       input.Pocs,
			Staff:      input.Staff,
			NudgeLogs:  input.NudgeLogs,
			Activity:   input.Activity,
			IsCurrent:  true,
			CreatedAt:  now,
			UpdatedAt:  now,
		}
		models.EmptySlices(&doc)
		res, err := s.coll.InsertOne(ctx, doc)
		if err != nil {
			return nil, err
		}
		doc.ID = res.InsertedID.(primitive.ObjectID)
		return &doc, nil
	}
	if err != nil {
		return nil, err
	}

	input.ApplyTo(existing)
	existing.UpdatedAt = now
	models.EmptySlices(existing)

	_, err = s.coll.ReplaceOne(ctx, bson.M{"_id": existing.ID}, existing)
	if err != nil {
		return nil, err
	}
	return existing, nil
}

func (s *Store) Create(ctx context.Context, input models.ActivationInput, setCurrent bool) (*models.Activation, error) {
	now := time.Now().UTC()

	if setCurrent {
		_, _ = s.coll.UpdateMany(ctx, bson.M{"isCurrent": true}, bson.M{
			"$set": bson.M{"isCurrent": false, "updatedAt": now},
		})
	}

	doc := models.Activation{
		SetupDone:  input.SetupDone,
		Info:       input.Info,
		Milestones: input.Milestones,
		Docs:       input.Docs,
		Visits:     input.Visits,
		Pocs:       input.Pocs,
		Staff:      input.Staff,
		NudgeLogs:  input.NudgeLogs,
		Activity:   input.Activity,
		IsCurrent:  setCurrent,
		CreatedAt:  now,
		UpdatedAt:  now,
	}
	models.EmptySlices(&doc)

	res, err := s.coll.InsertOne(ctx, doc)
	if err != nil {
		return nil, err
	}
	doc.ID = res.InsertedID.(primitive.ObjectID)
	return &doc, nil
}

func (s *Store) DeleteCurrent(ctx context.Context) error {
	_, err := s.coll.DeleteMany(ctx, bson.M{"isCurrent": true})
	return err
}

func (s *Store) List(ctx context.Context) ([]models.ActivationSummary, error) {
	opts := options.Find().SetSort(bson.D{{Key: "updatedAt", Value: -1}})
	cur, err := s.coll.Find(ctx, bson.M{}, opts)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var out []models.ActivationSummary
	for cur.Next(ctx) {
		var doc models.Activation
		if err := cur.Decode(&doc); err != nil {
			return nil, err
		}
		models.EmptySlices(&doc)
		out = append(out, models.ToSummary(doc))
	}
	if out == nil {
		out = []models.ActivationSummary{}
	}
	return out, cur.Err()
}

func (s *Store) SetCurrent(ctx context.Context, id primitive.ObjectID) (*models.Activation, error) {
	now := time.Now().UTC()
	_, _ = s.coll.UpdateMany(ctx, bson.M{"isCurrent": true}, bson.M{
		"$set": bson.M{"isCurrent": false, "updatedAt": now},
	})

	res, err := s.coll.UpdateOne(ctx, bson.M{"_id": id}, bson.M{
		"$set": bson.M{"isCurrent": true, "updatedAt": now},
	})
	if err != nil {
		return nil, err
	}
	if res.MatchedCount == 0 {
		return nil, ErrNotFound
	}
	return s.GetByID(ctx, id)
}

func (s *Store) SaveByID(ctx context.Context, id primitive.ObjectID, input models.ActivationInput) (*models.Activation, error) {
	existing, err := s.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	input.ApplyTo(existing)
	existing.UpdatedAt = time.Now().UTC()
	models.EmptySlices(existing)

	_, err = s.coll.ReplaceOne(ctx, bson.M{"_id": id}, existing)
	if err != nil {
		return nil, err
	}
	return existing, nil
}

func (s *Store) DeleteByID(ctx context.Context, id primitive.ObjectID) error {
	res, err := s.coll.DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		return err
	}
	if res.DeletedCount == 0 {
		return ErrNotFound
	}
	return nil
}
