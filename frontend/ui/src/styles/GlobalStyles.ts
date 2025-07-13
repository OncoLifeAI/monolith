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
  background: url('/src/assets/background.png') no-repeat center center fixed;
  background-size: cover;
  padding: 10px 20px;
`;

export const WrapperStyle = styled.div`
  border: 5px solid white;
  border-radius: 30px;
  height: calc(100vh - 20px);
  display: flex;
  flex-direction: column;
  position: relative;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 36px 36px 0 36px;
  flex-shrink: 0;
`;

export const Logo = styled.img`
  width: 56px;
  height: 56px;
`;