FROM python:3.12

WORKDIR /app

# The full 'python:3.12' image already includes build-essential,
# so we don't need to apt-get install it.

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
