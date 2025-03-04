import { MainLayout } from "./layouts/MainLayout";
import MapItinerary, { DayItinerary } from "./MapItinerary";
import { HomePage } from "./pages/HomePage";
import { Toaster } from 'react-hot-toast';

function App() {


  const itinerary: DayItinerary[] = [
    { "day": 1, "activities": [{ "name": "Luxembourg Gardens", "location": "Luxembourg Gardens, Paris, France", "transport_to_next": "Walking" }, { "name": "Sainte-Chapelle", "location": "Sainte-Chapelle, Paris, France", "transport_to_next": "Metro" }, { "name": "Place Dauphine", "location": "Place Dauphine, Paris, France", "transport_to_next": "Walking" }] },
    { "day": 2, "activities": [{ "name": "Montmartre", "location": "Montmartre, Paris, France", "transport_to_next": "Metro" }, { "name": "Basilica of the Sacré-Cœur", "location": "Basilica of the Sacré-Cœur, Paris, France", "transport_to_next": "Walking" }, { "name": "Place du Tertre", "location": "Place du Tertre, Paris, France", "transport_to_next": "Walking" }] },
    { "day": 3, "activities": [{ "name": "Rodin Museum", "location": "Rodin Museum, Paris, France", "transport_to_next": "Metro" }, { "name": "Les Invalides", "location": "Les Invalides, Paris, France", "transport_to_next": "Walking" }, { "name": "Musée d'Orsay", "location": "Musée d'Orsay, Paris, France", "transport_to_next": "Walking" }] },
    { "day": 4, "activities": [{ "name": "Seine River Cruise", "location": "Seine River, Paris, France", "transport_to_next": "Walking" }, { "name": "Ile de la Cité", "location": "Ile de la Cité, Paris, France", "transport_to_next": "Walking" }, { "name": "Latin Quarter", "location": "Latin Quarter, Paris, France", "transport_to_next": "Walking" }] },
    { "day": 5, "activities": [{ "name": "Parc des Buttes-Chaumont", "location": "Parc des Buttes-Chaumont, Paris, France", "transport_to_next": "Metro" }, { "name": "Canal Saint-Martin", "location": "Canal Saint-Martin, Paris, France", "transport_to_next": "Walking" }] }
  ]

  return (
    <MainLayout>
      <HomePage />
      <MapItinerary itinerary={itinerary} />
      <Toaster position="top-center" />
    </MainLayout>
  );
}

export default App;
