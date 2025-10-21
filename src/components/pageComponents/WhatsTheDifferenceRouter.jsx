// src/components/pageComponents/WhatsTheDifferenceRouter.jsx
import { Navigate } from "react-router-dom";
import ModeratorDifference from "./ModeratorDifference";
import WhatsTheDifference from "./WhatsTheDifference";

const WhatsTheDifferenceRouter = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Route based on student type
  switch(user.student_type) {
    case "Moderator":
      return <ModeratorDifference />;
    case "Senior":
    case "First-year":
    default:
      return <WhatsTheDifference />;
  }
};

export default WhatsTheDifferenceRouter;