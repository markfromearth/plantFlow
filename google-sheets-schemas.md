# Google Sheets Schemas

## 1. Inventory Schema

The following table structure tracks the plant-hire fleet and equipment attributes across the system.

| column_name | description_and_format |
| :--- | :--- |
| **`machine_id`** | Unique primary key (e.g. `EX-015`, `DM-100`) |
| **`name`** | Full display name of the equipment |
| **`category`** | Grouping for menus (e.g. `Excavators`, `Dumpers`, `Groundcare`) |
| **`job_fit`** | Customer-friendly functional description (e.g. `"Driveways, small footings"`) |
| **`access_width_mm`** | Critical spec for tight residential access, in millimeters (Integer) |
| **`day_rate`** | Base hire rate per day in GBP (Float/Integer) |
| **`delivery_rate`** | Delivery cost in GBP (Float/Integer) |
| **`availability_status`** | Real-time status string: `available`, `hired`, or `maintenance` |
| **`compliance_expiry`** | ISO Date String (`YYYY-MM-DD`) for safety/compliance checks |
| **`image_url`** | Public URL for the equipment photo |
| **`notes`** | Internal operator-facing details (e.g. "Tracks extendable, include 3 buckets") |

### Example Data

| machine_id | name | category | job_fit | access_width_mm | day_rate | delivery_rate | availability_status | compliance_expiry | image_url | notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `EX-015` | 1.5 Tonne Mini Digger | Excavators | Driveways, small footings, landscaping | 990 | 75 | 30 | available | 2027-05-10 | `https://unsplash...` | Tracks extendable. Comes with 3 buckets. |
| `EX-030` | 3 Tonne Digger | Excavators | Foundations, large extensions | 1550 | 110 | 45 | hired | 2027-01-15 | `https://unsplash...` | Cabbed, quick hitch. Check track tension. |
| `DM-100` | 1 Tonne Hi-Tip Dumper | Dumpers | Moving spoil into skips, tight access | 1120 | 60 | 30 | available | 2026-11-20 | `https://unsplash...` | Hydrostatic drive. Wash skip before return. |
| `CP-035` | Wacker Plate (350mm) | Compaction | Patio & block paving preparation | 350 | 25 | 15 | maintenance | 2026-08-05 | `https://unsplash...` | Petrol, pull start needs checking. Include rubber mat. |
| `TR-015` | Trencher Walk-Behind | Groundcare | Laying cables, water pipes, drainage | 700 | 90 | 35 | available | 2027-03-12 | `https://unsplash...` | Cuts up to 600mm deep. Check chain sharpness. |

---

## 2. Bookings Schema

The following table structure acts as the source of truth for the hire lifecycle, from request to final completion.

| column_name | description_and_format |
| :--- | :--- |
| **`booking_id`** | Unique primary key (e.g. `bk-17382210`, `bk-1`) |
| **`machine_id`** | Foreign key directly mapping to the Inventory Sheet |
| **`hirer_name`** | Full name of the customer |
| **`hirer_phone`** | Primary contact number |
| **`hirer_email`** | Optional contact email address |
| **`site_address`** | Delivery destination string, or "Collection" |
| **`start_date`** | Start date of hire (`YYYY-MM-DD`) |
| **`end_date`** | Expected end date of hire (`YYYY-MM-DD`) |
| **`delivery_window`** | Expected drop-off slot (e.g., `AM`, `PM`, or `None`) |
| **`status`** | Lifecycle state: `pending`, `confirmed`, `active`, `completed`, or `cancelled` |
| **`qr_start_code`** | Pre-generated random string appended to scan URLs for hire start |
| **`qr_end_code`** | Pre-generated random string appended to scan URLs for hire completion |
| **`timestamp_created`** | ISO datetime string representing when the booking was submitted (`YYYY-MM-DDTHH:mm:SS.sssZ`) |

### Example Data

| booking_id | machine_id | hirer_name | hirer_phone | hirer_email | site_address | start_date | end_date | delivery_window | status | qr_start_code | qr_end_code | timestamp_created |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `bk-1` | EX-030 | John Smith | 07700 900123 | john@example.com | 12 High St, London | 2026-06-13 | 2026-06-14 | AM | active | QR-BK1-START | QR-BK1-END | 2026-06-12T07:22:15.000Z |
| `bk-2` | EX-015 | Sarah Jones | 07700 900456 | sarah.j@example.com | Collection | 2026-06-14 | 2026-06-16 | None | confirmed | QR-BK2-START | QR-BK2-END | 2026-06-13T09:44:11.000Z |
| `bk-3` | DM-100 | Mark Evans | 07700 988231 | | 94 River Road, Bristol | 2026-06-15 | 2026-06-18 | PM | pending | QR-BK3-START | QR-BK3-END | 2026-06-13T10:14:04.000Z |
| `bk-4` | CP-035 | Chloe Piper | 07700 114674 | c.piper@demo.co | 2 View Crescent | 2026-06-08 | 2026-06-09 | AM | completed | QR-BK4-START | QR-BK4-END | 2026-06-05T14:33:55.000Z |
| `bk-5` | TR-015 | Liam T | 07700 923991 | | Collection | 2026-06-22 | 2026-06-22 | None | pending | QR-BK5-START | QR-BK5-END | 2026-06-13T12:05:00.000Z |

---

## 3. Operators Schema

The following table structure tracks the plant-hire operators (the users managing the hires and equipment) within the system.

| column_name | description_and_format |
| :--- | :--- |
| **`operator_id`** | Unique primary key identifying the operator (e.g., `OP-001`) |
| **`name`** | Full name of the operator |
| **`phone`** | Primary contact number of the operator |
| **`email`** | Email address for system logins and notifications |
| **`depot_address`** | The physical address of the operator's main depot or yard |

### Example Data

| operator_id | name | phone | email | depot_address |
| :--- | :--- | :--- | :--- | :--- |
| `OP-001` | Dave Mitchell | 07900 123456 | dave@m-planthire.co.uk | Unit 4, Trading Estate, Bristol, BS2 0EZ |
| `OP-002` | Alan Davies | 07800 654321 | alan.d@example.com | 15 Industrial Park, Cardiff, CF11 8EQ |
| `OP-003` | Bob Jenkins | 07700 888999 | bob.jenkins@hire-it.com | The Old Yard, London Road, Bath, BA1 6DF |
