
// pages/trainer/availability.js (SSG)
import AvailabilityManager from "@/components/AvailabilityManager";

export async function getStaticProps() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/availability`);
  const data = await res.json();

  return {
    props: {
      availability: data.availability || [],
    },
    revalidate: 60,
  };
}

export default function AvailabilityPage({ availability }) {
  return <AvailabilityManager availability={availability} />;
}
