# Cypress E2E Automation Framework

A Cypress-based end-to-end automation framework for validating business-critical workflows in a Power Quality Monitoring web application.

The framework covers authentication, dashboard monitoring, device discovery, event investigation, alarm lifecycle management, API synchronization, and cross-module validation using reusable Cypress commands and dynamic test data.

## Framework Highlights

- Reusable Cypress custom commands for common actions such as authentication
- Dynamic test data capture and validation across multiple application modules
- API synchronization using `cy.intercept()` and `cy.wait()`
- End-to-end validation across Dashboard, Devices, Events, and Alarms
- Business-critical workflows covering investigation, acknowledgement, resolution, and cross-module correlation
- Manual test documentation and defect reporting included

## Tech Stack

- Cypress
- JavaScript
- Node.js
- REST API validation
- Git / GitHub
- Excel-based test documentation

## Automated Test Coverage

1. Login → Dashboard Monitoring → Alarms Navigation
2. Device Discovery and Device Details Validation
3. Event Investigation and Event Details Validation
4. Alarm Lifecycle: Active → Acknowledge → Resolve
5. Dashboard → Alarms → Events Correlation