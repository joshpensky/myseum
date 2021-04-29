import tw from 'twin.macro';

const Logo = () => (
  <svg
    id="logo"
    css={tw`block h-full`}
    viewBox="0 0 26 30"
    xmlns="http://www.w3.org/2000/svg"
    aria-labelledby="logo-title">
    <title id="logo-title">Myseum Logo</title>
    <path
      css={tw`fill-current`}
      d="M2.40039 6.00002V7.20003H22.8005V6.00002L12.6004 0L2.40039 6.00002Z"
    />
    <path
      css={tw`fill-current`}
      d="M12.6006 16.1999L16.8006 9.59985H21.6007C21.6007 10.7999 21.0007 11.3999 20.4007 11.3999V22.7999H16.8006V15.5999L14.4006 19.7999H10.8006L8.4006 15.5999V22.7999H4.80059V11.3999C4.20059 11.3999 3.60059 10.7999 3.60059 9.59985H8.4006L12.6006 16.1999Z"
    />
    <path css={tw`fill-current`} d="M2.40001 25.2L0 27.6V30H25.2001V27.6L22.8001 25.2H2.40001Z" />
  </svg>
);

export default Logo;
