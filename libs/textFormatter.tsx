type Props = {
    text: string | undefined;
}
const TextFormatter = ({ text }: Props) => {
    // Quebra o texto em parágrafos sempre que encontrar um ponto seguido por um espaço
    const paragraphs = text?.split('. ').map((sentence, index, array) =>
        index === array.length - 1 ? sentence : sentence + '.'
    );

    return (
        <div className="max-w-6xl mx-auto leading-relaxed">
            {paragraphs?.map((paragraph, index) => (
                <div key={index}><p>{paragraph}</p><br /></div>
            ))}
        </div>
    );
};

export default TextFormatter;
