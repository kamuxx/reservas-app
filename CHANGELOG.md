# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Mis Reservas Feature**: Implemented the "My Reservations" section (`MisReservasComponent`) to list user reservations.
- **Reservation Details**: Added `ReservaDetalleComponent` to view specific reservation details.
- **Services**:
    - Created `ReservationService` to handle reservation-related API calls.
    - Added `environment.ts` and `environment.prod.ts` for environment configuration.
- **UI**: Added stylesheets and HTML templates for new components.

### Changed
- **Spaces Service**: Updated `SpacesService` to include new methods and better error handling.
- **Space Card**: Modified `SpaceCardComponent` to improve display logic.
- **Espacios Page**: Updated `EspaciosComponent` to integrate with new service logic.
- **Styles**: Updated `styles.css` with global style improvements.

### Fixed
- Addressed various bugs and improved stability in the reservation flow.
- [EspacioDetalle] Fixed a bug where events remained visible after deselecting a day in the calendar.

### Added
- [Reviews] Implemented review submission functionality in `ReservaDetalleComponent`.
- [Services] Added `addComment` method to `SpacesService` for posting reviews.
