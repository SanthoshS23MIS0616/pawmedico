PYTHON ?= python
PIP ?= $(PYTHON) -m pip
UVICORN ?= $(PYTHON) -m uvicorn
NPM ?= npm

.PHONY: backend-install frontend-install install backend-dev frontend-dev dev backend-test frontend-build test

backend-install:
	cd backend && $(PIP) install -r requirements.txt

frontend-install:
	cd frontend && $(NPM) install

install: backend-install frontend-install

backend-dev:
	cd backend && $(UVICORN) main:app --reload --port 8000

frontend-dev:
	cd frontend && $(NPM) run dev

dev:
	@echo Run 'make backend-dev' and 'make frontend-dev' in separate terminals.

backend-test:
	cd backend && $(PYTHON) -m pytest tests -q

frontend-build:
	cd frontend && $(NPM) run build

test: backend-test frontend-build
