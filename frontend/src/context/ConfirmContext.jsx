import { createContext, useContext, useState, useCallback } from 'react';

const ConfirmContext = createContext();

export function useConfirm() {
  return useContext(ConfirmContext);
}

export function ConfirmProvider({ children }) {
  const [modalData, setModalData] = useState(null);

  const confirmDialog = useCallback((message) => {
    return new Promise((resolve) => {
      setModalData({
        message,
        onConfirm: () => {
          setModalData(null);
          resolve(true);
        },
        onCancel: () => {
          setModalData(null);
          resolve(false);
        }
      });
    });
  }, []);

  return (
    <ConfirmContext.Provider value={{ confirmDialog }}>
      {children}
      {modalData && (
        <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={modalData.onCancel}>
          <div className="modal max-w-420" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Action</h3>
              <button onClick={modalData.onCancel}>✕</button>
            </div>
            <div className="p-24 flex flex-col gap-14">
              <p className="text-16">{modalData.message}</p>
              <div className="flex gap-10 justify-end mt-10">
                <button className="btn btn-outline" onClick={modalData.onCancel}>Cancel</button>
                <button className="btn btn-danger" onClick={modalData.onConfirm}>Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
