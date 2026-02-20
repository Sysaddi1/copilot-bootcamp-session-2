# Project Overview

## Introduction

This project is a full-stack JavaScript application designed as a starter template for the Copilot Bootcamp by Slalom. It consists of a React frontend and a Node.js/Express backend, organized in a monorepo structure using npm workspaces.

The target product experience for the ToDo app is a **minimalist, warm, futuristic, and modern** interface with strong clarity and usability.

## Architecture

The project follows a monorepo architecture with the following structure:

- `packages/frontend/`: React-based web application
- `packages/backend/`: Express.js API server

## Technology Stack

### Frontend
- React
- React DOM
- CSS for styling
- Jest for testing

### Backend
- Node.js
- Express.js
- Jest for testing

## Product Experience Direction

- UI must emphasize simplicity, readability, and focused task completion.
- Visual language should be warm and modern, with minimal visual noise.
- Interaction patterns should feel lightweight and polished (clear hierarchy, subtle feedback, consistent spacing).
- Detailed UI and styling rules are documented in `docs/ui-guidelines.md`.

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm (v7 or higher)

### Installation
1. Clone the repository
2. Run `npm install` at the root of the project to install all dependencies
3. Start the development environment using `npm run start`

## Development Workflow

The project uses npm workspaces to manage the monorepo structure. You can:

- Run `npm run start` from the root to start both frontend and backend in development mode
- Run `npm test` from the root to run tests for all packages
- Work on individual packages by navigating to their directories and using their specific scripts

## Deployment

General Guidelines, Code Style and Testing Practices will be covered in the bootcamp sessions.
