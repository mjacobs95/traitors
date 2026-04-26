PYTHON := .venv/bin/python

.PHONY: install run reset

install:
	python3 -m venv .venv
	.venv/bin/pip install -r requirements.txt

run:
	$(PYTHON) app.py

reset:
	@$(PYTHON) -c "import json; f='players.json'; d=json.load(open(f)); [x.update(status='active') for x in d]; json.dump(d, open(f,'w'), indent=2)"
	@echo "All players reset to active."
