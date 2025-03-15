const MapComponent = () => {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-between my-15">
      {/* Sol tarafta Harita */}
      <div className="lg:w-1/2 w-full mb-4 lg:mb-0">
        <div className="relative">
          <iframe
            className="rounded-4xl"
            title="Harita"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31437.27464594631!2d29.918743149999998!3d40.76544090000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14ccb1eae32f0f9d%3A0x7df178bc7d70c2f!2sİzmit%2C%20Kocaeli!5e0!3m2!1str!2str!4v1709362171476!5m2!1str!2str"
            width="100%"
            height="400"
            frameBorder="0"
            style={{ border: 0 }}
            allowFullScreen
            aria-hidden={false}
            tabIndex={0}
          />
        </div>
      </div>

      {/* Sağ tarafta Adres */}
      <div className="lg:w-1/2 w-full text-center lg:text-left lg:ml-8">
        <h2 className="text-2xl font-bold mb-4 text-[#333]">Adresimiz</h2>
        <p className="text-lg text-gray-700 mb-4">
          Güvercin Mahallesi, 705. Sokak No: 123, <br />
          İzmit, Kocaeli, Türkiye
        </p>
        <p className="text-gray-500">Telefon: +90 262 123 45 67</p>
      </div>
    </div>
  );
};

export default MapComponent;
