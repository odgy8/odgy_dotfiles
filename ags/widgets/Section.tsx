interface SectionProps {
  content: JSX.Element;
}

function Section({ content }: SectionProps) {
  return <box>{content}</box>;
}

export default Section;
