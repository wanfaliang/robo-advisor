from setuptools import setup, find_packages

setup(
    name="robo-advisor",
    version="0.1",
    packages=find_packages(),
    install_requires=[
        "fastapi",
        "uvicorn",
        "sqlalchemy",
        "pydantic",
        "python-dotenv",
        "yfinance",
        "numpy",
        "pandas",
        "scipy",
    ],
) 