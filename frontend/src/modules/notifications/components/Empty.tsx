export const Empty = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 10,
        paddingTop: 40,
      }}
    >
      <span role="img" aria-hidden style={{ fontSize: 32, opacity: 0.25 }}>
        🔔
      </span>
      <div
        style={{
          fontSize: 13,
          color: 'rgba(255,255,255,0.2)',
          fontWeight: 500,
        }}
      >
        All caught up
      </div>
    </div>
  );
};
