                    ┌──────────────────────────────┐
                    │        CLIENT APP            │
                    │ (Web / Mobile / Postman)     │
                    └─────────────┬────────────────┘
                                  │
                                  │ POST /process-payment
                                  │ + Idempotency-Key
                                  ▼
                    ┌──────────────────────────────┐
                    │      EXPRESS SERVER          │
                    │   (Payment API Backend)      │
                    └─────────────┬────────────────┘
                                  │
                                  ▼
                    ┌──────────────────────────────┐
                    │  IDEMPOTENCY MIDDLE LAYER    │
                    │  - Check Key Exists?         │
                    │  - Compare Request Body      │
                    └─────────────┬────────────────┘
                                  │
          ┌───────────────────────┼────────────────────────┐
          │                       │                        │
          ▼                       ▼                        ▼
 ┌──────────────┐     ┌──────────────────┐     ┌────────────────────┐
 │ NEW REQUEST  │     │ DUPLICATE SAME   │     │ SAME KEY + DIFF    │
 │              │     │ REQUEST          │     │ REQUEST BODY       │
 └──────┬───────┘     └────────┬─────────┘     └────────┬───────────┘
        │                      │                         │
        ▼                      ▼                         ▼
 ┌──────────────┐     ┌──────────────────┐     ┌────────────────────┐
 │ PROCESSING   │     │ RETURN CACHED    │     │ RETURN 409 ERROR   │
 │ (2 sec delay)│     │ RESPONSE         │     │ CONFLICT           │
 └──────┬───────┘     └──────────────────┘     └────────────────────┘
        │
        ▼
 ┌──────────────────────┐
 │ STORE IN MAP MEMORY  │
 │ - body               │
 │ - response           │
 │ - status             │
 └──────────────────────┘
