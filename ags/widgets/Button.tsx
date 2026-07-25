import ButtonCss from "./Button.css";

interface ButtonProps<T> {
  text: string;
  onClick: () => T;
}

function Button<T>({ text, onClick }: ButtonProps<T>) {
  return (
    <button css={ButtonCss} class="basic-button" $type="end" onClicked={onClick}>
      <label label={text} />
    </button>
  );
}

export default Button;
