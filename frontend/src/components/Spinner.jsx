export function Spinner({ small }) {
  return <div className={`spinner${small ? ' spinner-sm' : ''}`} />;
}

export function PageLoader() {
  return (
    <div className="flex justify-center items-center py-60">
      <Spinner />
    </div>
  );
}
