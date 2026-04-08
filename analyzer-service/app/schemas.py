from pydantic import BaseModel

class TaskStats(BaseModel):
    total:     int
    completed: int
    pending:   int

class StatsResponse(BaseModel):
    userId:   int
    userName: str
    stats:    TaskStats

class ErrorResponse(BaseModel):
    detail: str