def clean_qdrant_response(raw_response: dict):
    cleaned = []

    points = raw_response.get("points", [])

    for p in points:
        payload = p.get("payload", {})
        text = payload.get("text")

        if not text:
            continue

        cleaned.append({
            "text": text,
            "score": round(p.get("score", 0.0), 4),
        })

    return cleaned
