const API_MOVIE = "http://localhost:8081/movies";
const API_SHOW = "http://localhost:8082/shows";
const API_BOOKING = "http://localhost:8083/booking";

export async function getMovies() {
    const res = await fetch(API_MOVIE, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    });

    return res.json();
}

export const getShowsByMovie = async (movieId) => {
  const res = await fetch(`${API_SHOW}/movie/${movieId}`);
  return res.json();
};

export const getSeats = async (showId) => {
  const res = await fetch(`${API_SHOW}/${showId}/seats`);
  return res.json();
};

export const bookTicket = async (data) => {
  const res = await fetch(`${API_BOOKING}/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
};
