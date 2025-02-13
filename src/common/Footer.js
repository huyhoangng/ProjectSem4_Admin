import React from "react";

const Footer = () => {
  return (
    <footer className="sticky bottom-0 bg-white py-4 shadow-md">
      <div className="container mx-auto text-center">
        <span className="text-gray-600">Copyright &copy; Your Website 2021</span>
      </div>
    </footer>
  );
};

const ScrollToTop = () => {
  return (
    <a
      href="#page-top"
      className="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition"
    >
      <i className="fas fa-angle-up"></i>
    </a>
  );
};

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">{children}</div>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Layout;