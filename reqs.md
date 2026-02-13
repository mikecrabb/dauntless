# SCV Dauntless – Prioritisation Engine Specification

## Purpose

This document specifies the requirements for a lightweight HTML/JavaScript application used by an instructor to evaluate team prioritisation decisions during a live teaching session.

The application:

- Accepts selected user stories (S1–S30)
- Validates resource (RU) and slot constraints
- Applies hidden weighted scoring logic
- Generates outcome bands
- Produces consequence messages
- Allows weight adjustment between rounds
- Keeps internal logic hidden from students

This is an instructor-only decision engine. It is not student-facing.

---

# 1. System Overview

## Application Type
- Single-page HTML application
- Vanilla JavaScript (no frameworks required)
- No backend
- Runs locally in browser

## Primary Use Case
Instructor inputs selected stories for a team and receives:
- Total RU used
- Total slots used
- Computed weighted score
- Outcome classification
- Triggered consequence messages

---

# 2. Core Data Model

Each story must be represented as an object with:

```javascript
{
  id: "S1",
  ru: 20,
  slots: 2,
  tags: ["survival", "structural", "irreversible"]
}
