install:
	python -m venv venv
	call venv\Scripts\activate && pip install -r requirements.txt

run:
	call venv\Scripts\activate && flask run --host=0.0.0.0 --port=3000

