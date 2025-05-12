// pages/trainer/classes/index.js (SSG)
import TrainerClassList from "@/components/TrainerClassList";

export async function getStaticProps() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/classes`);
  const data = await res.json();

  return {
    props: {
      classes: data.classes || [],
    },
    revalidate: 60,
  };
}

export default function TrainerClassListPage({ classes }) {
  return <TrainerClassList classes={classes} />;
}