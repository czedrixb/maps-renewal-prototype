'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export interface Profile {
  name: string;
  role: string;
  academy: string;
}

const DEFAULT_PROFILE: Profile = {
  name: '이지현 선생님',
  role: '강사',
  academy: 'W아카데미',
};

/** Returns the first character of the name for use as an avatar initial. */
export function initialOf(name: string): string {
  return name.trim()[0] ?? '?';
}

interface ProfileCtx {
  profile: Profile;
  setProfile: (patch: Partial<Profile>) => void;
}

const ProfileContext = createContext<ProfileCtx>({
  profile: DEFAULT_PROFILE,
  setProfile: () => {},
});

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<Profile>(DEFAULT_PROFILE);

  const setProfile = (patch: Partial<Profile>) =>
    setProfileState((prev) => ({ ...prev, ...patch }));

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
