
import os
from fastapi import FastAPI, HTTPException
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

@app.get("/api/tariffs/current")
def get_current_tariffs(distributor: str = "LIGHT"):

    try:
        response = (
            supabase.table("tariffs")
            .select("*")
            .eq("distributor", distributor)
            .eq("state", "RJ")
            .execute()
        )

        return {
            "success": True,
            "data": response.data
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail="Erro ao consultar tarifas"
        )
