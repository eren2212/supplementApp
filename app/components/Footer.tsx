import { FaInstagram, FaFacebook, FaTwitter } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className=" text-gray-800 py-8 mt-16">
      <div className="container mx-auto px-6">
        <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
          <div className="mb-6 sm:mb-0">
            <h2 className="text-2xl font-bold mb-4">Takip Edin</h2>
            <div className="flex justify-center sm:justify-start space-x-6">
              <a
                href="https://www.instagram.com/joinpharmto/"
                className="text-gray-800 hover:text-gray-600"
              >
                <FaInstagram size={30} />
              </a>
              <a href="#" className="text-gray-800 hover:text-gray-600">
                <FaFacebook size={30} />
              </a>
              <a href="#" className="text-gray-800 hover:text-gray-600">
                <FaTwitter size={30} />
              </a>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Hızlı Bağlantılar</h2>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-800 hover:text-gray-600">
                  Anasayfa
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-800 hover:text-gray-600">
                  Hakkımızda
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-800 hover:text-gray-600">
                  Ürünler
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-800 hover:text-gray-600">
                  İletişim
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} Tüm Hakları Saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
