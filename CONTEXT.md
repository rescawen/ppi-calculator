# Display Catalog

The display catalog provides selectable pixel resolutions and real-world display configurations for the PPI calculator.

## Language

**Resolution Preset**:
A named pair of horizontal and vertical pixel dimensions without a specific physical display identity.
_Avoid_: Device, screen

**Device**:
A real-world display configuration identified by its pixel resolution, diagonal size, and model label.
_Avoid_: Resolution

**Brand Group**:
A collection of Devices associated with the same manufacturer or product family.
_Avoid_: Resolution group

**Aspect-Ratio Group**:
A collection of Resolution Presets sharing a display proportion such as 16:9 or 4:3.
_Avoid_: Brand

**Catalog Section**:
One of the catalog's three top-level families: Resolutions, Brands, or Aspect Ratios.
_Avoid_: Brand filter, device type

**Resolution Overview**:
The default catalog section: a curated subset of Resolution Presets drawn from the same catalog as the Aspect-Ratio Groups. Presets are ordered by total pixel count, with horizontal and then vertical pixels breaking ties.
_Avoid_: All resolutions, device list
