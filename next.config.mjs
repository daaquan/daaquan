import createMDX from '@next/mdx';

const withMDX = createMDX({});
export default withMDX({
  output: 'export',
  trailingSlash: true,
  poweredByHeader: false,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
});
