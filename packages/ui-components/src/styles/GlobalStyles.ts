import { createGlobalStyle } from 'styled-components';
import { theme } from './theme';
import styled from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
    height: 100%;
  }

  body {
    margin: 0;
    font-family: ${theme.fonts.body};
    font-size: ${theme.fontSizes.base};
    line-height: 1.6;
    color: ${theme.colors.gray[800]};
    background-color: ${theme.colors.gray[50]};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    height: 100%;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${theme.fonts.heading};
    font-weight: 600;
    line-height: 1.2;
    margin-bottom: ${theme.spacing.md};
  }

  h1 {
    font-size: ${theme.fontSizes['4xl']};
  }

  h2 {
    font-size: ${theme.fontSizes['3xl']};
  }

  h3 {
    font-size: ${theme.fontSizes['2xl']};
  }

  p {
    margin-bottom: ${theme.spacing.md};
    font-size: 0.75rem;
  }

  a {
    color: ${theme.colors.primary};
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: ${theme.colors.gray[700]};
    }
  }

  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    outline: none;
  }

  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
  }

  img {
    max-width: 100%;
    height: auto;
  }
`; 


export const Background = styled.div`
  min-height: 100vh;
  width: 100%;
  /* Code-generated, performant background (no external image) */
  background-image:
    /* subtle grid */
    repeating-linear-gradient(0deg, rgba(255,255,255,0.25) 0 1px, rgba(255,255,255,0) 1px 24px),
    repeating-linear-gradient(90deg, rgba(255,255,255,0.25) 0 1px, rgba(255,255,255,0) 1px 24px),
    /* stronger blue radial glows */
    radial-gradient(900px 700px at 75% 18%, rgba(59,130,246,0.32) 0%, rgba(59,130,246,0.00) 60%),
    radial-gradient(720px 540px at 20% 80%, rgba(79,70,229,0.24) 0%, rgba(79,70,229,0.00) 60%),
    radial-gradient(600px 480px at 50% 95%, rgba(14,165,233,0.20) 0%, rgba(14,165,233,0.00) 60%),
    /* slightly darker base vertical wash */
    linear-gradient(180deg, #e6f0ff 0%, #e1efff 30%, #ddeeff 60%, #f5f9ff 100%);
  background-attachment: fixed, fixed, fixed, fixed, fixed, fixed;
  background-size: auto, auto, cover, cover, cover, cover;
  padding: 10px 20px;
`;

export const WrapperStyle = styled.div`
  border: 5px solid white;
  border-radius: 30px;
  min-height: calc(100vh - 20px);
  max-height: calc(100vh - 20px);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    border-radius: 20px;
    border-width: 3px;
    min-height: calc(100vh - 16px);
    max-height: calc(100vh - 16px);
  }

  @media (max-width: 480px) {
    border-radius: 15px;
    border-width: 2px;
    min-height: calc(100vh - 12px);
    max-height: calc(100vh - 12px);
  }
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  height: 100vh;
  min-height: 0;
  background-color: #F8F9FA;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  background-color: #FFFFFF;
  border-bottom: 1px solid #E0E0E0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  
  @media (max-width: 767px) {
    position: sticky;
    top: 4rem; /* Height of mobile navigation */
    z-index: 10;
  }
`;

export const Title = styled.h1`
  font-size: 2.25rem;
  font-weight: 700;
  color: #2C3E50;
  margin: 0;
  letter-spacing: -0.5px;
  text-align: center;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.75rem;
    letter-spacing: -0.25px;
  }
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  padding: 2rem;
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  overflow-y: auto;
  height: 100vh;
`;

export const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #E9ECEF;
  
  @media (max-width: 767px) {
    position: sticky;
    top: 4rem; /* Height of mobile navigation */
    z-index: 10;
    background-color: #f9fafb;
    padding-top: 1rem;
    margin-top: -1rem;
  }
`;

export const PageTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 600;
  color: #495057;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const Logo = styled.img`
  width: 56px;
  height: 56px;
`;

interface CardProps {
  width?: string;
}

export const Card = styled.div<CardProps>`
  background: rgba(255, 255, 255, 0.85);
  border-radius: 1.5rem;
  box-shadow: 0 4px 32px rgba(0,0,0,0.07);
  padding: 2rem;
  max-width: ${(props) => props.width === '100%' ? '720px' : (props.width || '490px')};
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1rem;

  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 1.25rem;
    margin: 0.75rem;
    max-width: calc(100% - 1.5rem);
  }

  @media (max-width: 480px) {
    padding: 1.25rem;
    border-radius: 1rem;
    margin: 0.5rem;
    max-width: calc(100% - 1rem);
    box-shadow: 0 2px 16px rgba(0,0,0,0.08);
  }
`;

export const Subtitle = styled.p`
  font-size: 1rem;
  color: #666;
  margin-bottom: 1.5rem;
  text-align: center;
  line-height: 1.4;

  @media (max-width: 480px) {
    font-size: 0.9rem;
    margin-bottom: 1.25rem;
  }
`;