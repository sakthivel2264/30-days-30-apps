python -m venv myenv

myenv\Scripts\activate

pip install -r requirements.txt

if CPU 
pip install fastapi==0.104.1
pip install uvicorn==0.24.0
pip install torch --index-url https://download.pytorch.org/whl/cpu
pip install transformers
pip install pydantic
