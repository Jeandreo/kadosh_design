import { useUploadForm } from '../hooks/useUploadForm';

interface Props {
  onClose: () => void;
}

export const UploadModal = ({ onClose }: Props) => {
  const form = useUploadForm();

  return (
    <div>
      <button onClick={onClose}>Fechar</button>
      <form onSubmit={form.submit}>
        inputs aqui
      </form>
    </div>
  );
};
