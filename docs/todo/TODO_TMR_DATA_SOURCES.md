# TMR / Queensland Data Sources — Demo Collection

> Scope: future portfolio demo data, especially `apps/demo-datavis`, `apps/demo-ai-pipeline`, and
> possible portfolio case-study content.
>
> Note: this is a **demo-first mock-data** source list. Accuracy, freshness, and complete production
> suitability are not required. These sources are mainly inspiration/provenance for believable mock
> datasets, not a commitment to live integrations or official reporting.

---

## Best Candidates

- **Transport customer service centres**
  - Format: CSV
  - Use for: map/list of service centres, searchable service locator, customer-service dashboard.
  - Good fit for: portfolio shell, service finder fixture, geospatial UI.

- **Customer service centre wait times**
  - Format: CSV
  - Use for: wait-time dashboard, service-centre comparison, time-series chart, operational KPIs.
  - Good fit for: `demo-datavis`.

- **Registration call centre enquiries daily for last month**
  - Format: CSV
  - Use for: daily enquiry trend, registration-support workload, call-volume chart.
  - Good fit for: registration renewal / customer-service narrative.

- **Non-generic call centre enquiries last month**
  - Format: CSV
  - Use for: enquiry classification, operational triage dashboard, support-demand chart.
  - Good fit for: AI service-finder or service-demand analytics.

- **Translink monthly performance data**
  - Format: CSV
  - Use for: mode performance, complaints, customer experience, monthly trends.
  - Good fit for: polished data visualisation demo.

- **Traffic census for the Queensland state-declared road network**
  - Format: CSV, XLSX, KML
  - Use for: traffic volume charts, heavy-vehicle comparisons, road network map overlays.
  - Good fit for: `demo-datavis`.

- **Queensland traffic data averaged by hour/day**
  - Format: CSV, XLSX, TXT
  - Use for: heatmap by day/hour, traffic pattern dashboard, peak-period analysis.
  - Good fit for: strong visual chart demo.

- **Road location and traffic data**
  - Format: CSV, PDF
  - Use for: road segment table, traffic count lookup, network summaries.
  - Good fit for: transport data explorer.

- **Road crash locations - Queensland**
  - Format: spatial data, metadata XML
  - Use for: crash-location map, road-safety dashboard, severity filters.
  - Good fit for: map-heavy data visualisation.

- **QLDTraffic GeoJSON API**
  - Format: GeoJSON / API spec
  - Use for: hazards, crashes, congestion, flooding, roadworks, special events, cameras.
  - Good fit for: live-looking traffic dashboard.
  - Caveat: collected note says data usability rating is poor / link status uncertain. Use as inspiration
    or snapshot it if working later.

- **Transport features - Queensland series**
  - Format: ArcGIS REST, WMS, SHP/TAB/FGDB/KMZ/GPKG
  - Use for: transport feature map layers: railways, stations, busway stations, bridges, tunnels,
    toll points, airports.
  - Good fit for: geospatial network/feature explorer.

---

## Secondary Candidates

- **Translink real-time data**
  - Format: GTFS-RT / CSV-listed source
  - Use for: real-time-style transit feed demo, vehicle updates, service alerts.
  - Caveat: likely more integration work than static CSV.

- **Translink Origin-Destination Trips 2022 Onwards**
  - Format: ZIP, CSV
  - Use for: origin/destination matrix, Sankey-style trip flows, network demand.
  - Good fit for: more advanced data visualisation if time allows.

- **Q-Ride providers**
  - Format: CSV
  - Use for: provider locator, licence/training service search.
  - Good fit for: driver licence renewal context.

- **BoatSafe training organisations**
  - Format: CSV
  - Use for: provider locator, training organisation search.
  - Good fit for: smaller service-finder demo data.

- **Proposed road closures**
  - Format: CSV
  - Use for: road closure map/table, public notification workflow, route-impact list.
  - Good fit for: traffic/disruption story.

- **DTMR Digital Projects Dashboard contribution**
  - Format: CSV
  - Use for: portfolio/project governance dashboard, digital transformation metrics.
  - Good fit for: case-study flavour rather than core transport UI.

- **Department of Transport and Main Roads Contract Disclosure**
  - Format: CSV
  - Use for: procurement table, spend breakdown, public transparency dashboard.
  - Good fit for: secondary portfolio content.

- **Department of Transport and Main Roads On Time Payments**
  - Format: CSV
  - Use for: operational performance dashboard.
  - Good fit for: KPI-style charting.

---

## API / Discovery Layer

- **Queensland Open Data / CKAN API**
  - Useful endpoints from notes:
    - `package_list`
    - `package_search`
    - `package_show`
    - `resource_search`
    - `group_list`
    - `tag_list`
  - Use for:
    - dataset discovery script
    - source metadata extraction
    - building a curated local dataset manifest
  - Demo approach:
    - query once during data-prep
    - save a compact JSON snapshot in the repo
    - do not depend on live CKAN calls for the public demo unless needed

- **ArcGIS REST services**
  - Candidate sources:
    - Transport features - Queensland series
    - Stock routes - Queensland
  - Use for:
    - map layers
    - feature search
    - transport network overlays
  - Demo approach:
    - sample small areas or pre-export simplified GeoJSON
    - avoid huge geometry payloads in the client bundle

---

## Likely Demo Mapping

### `demo-datavis`

- Customer service centre wait times
- Registration call centre enquiries
- Non-generic call centre enquiries
- Translink monthly performance data
- Queensland traffic data averaged by hour/day
- Traffic census for state-declared road network
- Road crash locations
- QLDTraffic GeoJSON-style incidents

Possible views:

- service demand over time
- wait-time KPI cards
- traffic heatmap by day/hour
- crash or incident map
- transport mode performance comparison

### `demo-ai-pipeline`

- AI Service Finder can reference:
  - Transport customer service centres
  - Q-Ride providers
  - BoatSafe training organisations
  - registration/call-centre enquiry themes

- Fixture text can mention:
  - source context from Queensland Open Data
  - confidence/review flags
  - stale-data warnings
  - human review for transactional advice

---

## Practical Mock-Data Strategy

- Prefer static mock snapshots for the portfolio:
  - stable demo
  - no network dependency
  - no API key concerns
  - easier CI/test flow

- Keep mock data small:
  - sample rows
  - aggregate by date/category
  - simplify geometry
  - store as JSON when the app consumes JSON more naturally

- Use real source names as inspiration/provenance when useful:
  - looks grounded
  - helps presentation
  - makes the mock data feel domain-specific

- Add a short disclaimer in demo docs:
  - data is mock, sampled, or transformed for portfolio use
  - visualisations are portfolio examples
  - not official TMR reporting

---

## Follow-Up Tasks

- [ ] Choose one primary dataset family for `demo-datavis`
- [ ] Decide whether `demo-datavis` is map-first, chart-first, or dashboard-first
- [ ] Create a small `data/sources.json` manifest with source-inspired names, URLs, formats, and intended use
- [ ] Write a data-prep script only if the chosen source is too large or awkward to consume directly
- [ ] Prefer committed mock snapshots over live API calls for the first publishable version
- [ ] Keep any live/API integration behind a feature flag or server route
