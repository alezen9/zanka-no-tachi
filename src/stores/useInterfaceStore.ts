import { create } from "zustand";

type InterfacceState = {
  isAudioActive: boolean;
  toggleAudio: VoidFunction;
  isBankaiActive: boolean;
  toggleBankai: VoidFunction;
};

const useInterfaceStore = create<InterfacceState>((set) => {
  return {
    isAudioActive: false,
    toggleAudio: () => {
      set((state) => ({ isAudioActive: !state.isAudioActive }));
    },
    isBankaiActive: false,
    toggleBankai: () => {
      set((state) => ({ isBankaiActive: !state.isBankaiActive }));
    },
  };
});

export default useInterfaceStore;
