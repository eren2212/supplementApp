import FeaturedFeatures from "../components/home/Featured";
import HowItWorks from "../components/home/HowItWorks";
import InfoSection from "../components/home/InfoSection";
import TaskComponent from "../components/home/TaskComponent";
import Map from "../components/home/Map";
import Accordion from "../components/home/Accordion";

export default function Home() {
  return (
    <div>
      <TaskComponent />
      <InfoSection />
      <HowItWorks />
      <FeaturedFeatures />
      <Accordion />
      <Map />
    </div>
  );
}
