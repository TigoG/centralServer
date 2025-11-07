export async function GetAllStations({
  baseUrl = "http://145.24.237.211:8445/",
} = {}) {
  const controller = new AbortController();
  const timeoutMs = 8000;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = baseUrl + "getStations";

    const res = await fetch(url);
    clearTimeout(timeout);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const err = new Error(
        `Failed to fetch stations: ${res.status} ${res.statusText}`
      );
      err.status = res.status;
      err.body = text;
      throw err;
    }

    const data = await res.json();
    return data;
  } catch (err) {
    clearTimeout(timeout);
    // normalize AbortError message
    if (err.name === "AbortError") {
      err.message = `Request timed out after ${timeoutMs}ms`;
    }
    console.error("GetAllStations error:", err);
    throw err;
  }
}

export async function GetStations() {
  const response = await fetch("http://145.24.237.211:8000/getStations");
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  console.log(response.status + response.statusText);
  console.log("Fetched stations from backend:", data);

  return data; // ⬅️ Alleen de data
}
