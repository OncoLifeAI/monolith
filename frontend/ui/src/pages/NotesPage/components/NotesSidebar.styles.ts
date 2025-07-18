import styled from 'styled-components';

export const SidebarContainer = styled.div`
  height: 100%;
  background-color: #ffffff;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const NotesList = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
`; 