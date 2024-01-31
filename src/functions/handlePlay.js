import { useNavigate } from "react-router-dom";

export async function HandlePlay() {
  const navigate = useNavigate();
  navigate("/play");
}
