package com.uniovi.tests;

//Paquetes Java
import java.util.List;

//Paquetes JUnit 
import org.junit.*;
import org.junit.runners.MethodSorters;

import static org.junit.Assert.assertTrue;
//Paquetes Selenium 
import org.openqa.selenium.*;
import org.openqa.selenium.firefox.*;

import com.uniovi.tests.util.InsertSampleData;
import com.uniovi.tests.util.PasswordEncrypter;
//Paquetes Utilidades de Testing Propias
import com.uniovi.tests.util.SeleniumUtils;

//Paquetes con los Page Object
import com.uniovi.tests.pageobjects.*;


//Ordenamos las pruebas por el nombre del método
@FixMethodOrder(MethodSorters.NAME_ASCENDING) 
public class SdiEntrega2Tests {
	//En Windows (Debe ser la versión 65.0.1 y desactivar las actualizacioens automáticas)):
	//static String PathFirefox65 = "C:\\Program Files\\Mozilla Firefox\\firefox.exe";
	//static String Geckdriver024 = "C:\\Path\\geckodriver024win64.exe";
	//En MACOSX (Debe ser la versión 65.0.1 y desactivar las actualizacioens automáticas):
	//static String PathFirefox65 = "/Applications/Firefox 2.app/Contents/MacOS/firefox-bin";
	//static String PathFirefox64 = "/Applications/Firefox.app/Contents/MacOS/firefox-bin";
	//static String Geckdriver024 = "/Users/delacal/Documents/SDI1718/firefox/geckodriver024mac";
	//static String Geckdriver022 = "/Users/delacal/Documents/SDI1718/firefox/geckodriver023mac";
	
	static String PathFirefox65 = "C:\\Program Files\\Mozilla Firefox\\firefox.exe";
	static String Geckdriver024 = "C:\\Users\\alber\\Downloads\\PL-SDI-Sesión5-material\\PL-SDI-Sesión5-material\\geckodriver024win64.exe";
	
	//Común a Windows y a MACOSX
	static WebDriver driver = getDriver(PathFirefox65, Geckdriver024); 
	static String URL = "https://localhost:8081";


	public static WebDriver getDriver(String PathFirefox, String Geckdriver) {
		System.setProperty("webdriver.firefox.bin", PathFirefox);
		System.setProperty("webdriver.gecko.driver", Geckdriver);
		WebDriver driver = new FirefoxDriver();
		return driver;
	}
	
	@Before
	public void setUp(){
		driver.navigate().to(URL);
		//Insertamos los datos en la base de datos
		InsertSampleData.initDb();
	}
	@After
	public void tearDown(){
		driver.manage().deleteAllCookies();
		//Borramos todos los datos de la base de datos
		InsertSampleData.deleteAll();
	}
	@BeforeClass 
	static public void begin() {
		//COnfiguramos las pruebas.
		//Fijamos el timeout en cada opción de carga de una vista. 2 segundos.
		InsertSampleData.connect();
		
		//Se cargan los documentos de usuarios y ofertas que se subiran a la base de datos
		InsertSampleData.loadUsers(PasswordEncrypter.encrypt("123456"));
		InsertSampleData.loadOffers();
		
		//Eliminamos todos los datos para asegurar el estado inicial de la base de datos
		InsertSampleData.deleteAll();
		PO_View.setTimeout(4);
	}
	@AfterClass
	static public void end() {
		//Cerramos el navegador al finalizar las pruebas
		driver.quit();
	}

	//PR01. Registro de Usuario con datos válidos
	@Test
	public void PR01() {
		PO_PrivateView.doSignup(driver, "alber@ovi.com", "Alberto", "Martinez", "123456","123456");
		
		PO_View.checkElement(driver, "text", "Detalles");
	}

	//PR02. Registro de Usuario con datos inválidos (email, nombre y apellidos vacíos)
	@Test
	public void PR02() {
		PO_PrivateView.doSignup(driver, "a@e", "Alberto", "Nuñez", "123456","123456");
		
		PO_View.checkElement(driver, "text", "El email tiene");
		
		PO_PrivateView.doSignup(driver, "alberton@email.es", " ", "Nuñez", "123456","123456");
		
		PO_View.checkElement(driver, "text", "El nombre no puede estar vacio");
		
		PO_PrivateView.doSignup(driver, "alberton@email.es", "Alberto", " ", "123456","123456");
		
		PO_View.checkElement(driver, "text", "El apellido no puede estar vacio");	
	}

	//PR03. Registro de Usuario con datos inválidos (repetición de contraseña inválida).
	@Test
	public void PR03() {
		PO_PrivateView.doSignup(driver, "rober@ovi.com", "Roberto", "Martinez", "123456","153451");		
		
		PO_View.checkElement(driver, "text", "Las contraseñas no coinciden");
	}
	
	//PR04. Registro de Usuario con datos inválidos (email existente).
	@Test
	public void PR04() {
		PO_PrivateView.doSignup(driver, "pedro@email.es", "Pedro", "Martinez", "123456","123456");		
		
		PO_View.checkElement(driver, "text", "El email ya está en uso");	
	}
	
	//PR05. Inicio de sesión con datos válidos.
	@Test
	public void PR05() {
		PO_PrivateView.doLogin(driver, "pedro@email.es", "123456");
		
		PO_View.checkElement(driver, "text", "Detalles");
	}
	
	//PR06. Inicio de sesión con datos inválidos (email existente, pero contraseña incorrecta).
	@Test
	public void PR06() {
		PO_PrivateView.doLogin(driver, "pedro@email.es", "12346");
		
		PO_View.checkElement(driver, "text", "incorrecto");			
	}
	
	//PR07. Inicio de sesión con datos inválidos (campo email o contraseña vacíos)
	@Test
	public void PR07() {
		PO_PrivateView.doLogin(driver, "pedro@email.es", " ");
		
		PO_View.checkElement(driver, "text", "vacia");		
	}	
	
	//PR08. Inicio de sesión con datos inválidos (email no existente en la aplicación)
	@Test
	public void PR08() {
		PO_PrivateView.doLogin(driver, "wendon@ovi.com", "123456");
		
		PO_View.checkElement(driver, "text", "incorrecto");		
	}	
	
	//PR09. Hacer click en la opción de salir de sesión y comprobar que se redirige a la página de inicio de sesión (Login).
	@Test
	public void PR09() {
		PO_PrivateView.doLogin(driver, "pedro@email.es", "123456");
		
		PO_PrivateView.doLogout(driver);
		
		PO_View.checkElement(driver, "text", "Email");
	}	
	//PR10. Comprobar que el botón cerrar sesión no está visible si el usuario no está autenticado.
	@Test
	public void PR10() {
		SeleniumUtils.textoNoPresentePagina(driver, "Desconectar");			
	}	
	
	//PR11. Mostrar el listado de usuarios y comprobar que se muestran todos los que existen en el sistema /
	@Test
	public void PR11() {
		PO_PrivateView.doLogin(driver, "admin@email.com", "admin");
		
		PO_NavView.clickOption(driver, "usuario/list","class", "table table-hover");
		
		PO_View.checkElement(driver, "text", "Pedro");
		
		PO_View.checkElement(driver, "text", "Pelayo");
		
		PO_View.checkElement(driver, "text", "Alberto");
		
		PO_View.checkElement(driver, "text", "Lucas");
		
		PO_PrivateView.doLogout(driver);			
	}	
	
	//PR12. Ir a la lista de usuarios, borrar el primer usuario de la lista, comprobar que la lista se actualiza y dicho usuario desaparece.
	@Test
	public void PR12() {
		PO_PrivateView.doLogin(driver, "admin@email.com", "admin");
		
		PO_NavView.clickOption(driver, "usuario/list","class", "table table-hover");
	
		PO_UserListView.deleteUsers(1, driver);
		
		SeleniumUtils.textoNoPresentePagina(driver, "pedro@email.com");
		
		PO_PrivateView.doLogout(driver);			
	}	
	
	//PR13. Ir a la lista de usuarios, borrar el último usuario de la lista, comprobar que la lista se actualiza y dicho usuario desaparece.
	@Test
	public void PR13() {
		PO_PrivateView.doLogin(driver, "admin@email.com", "admin");
		
		PO_NavView.clickOption(driver, "usuario/list","class","table table-hover");
	
		PO_UserListView.deleteLast(driver);

		PO_PrivateView.doLogout(driver);		
	}	

	//PR14. Ir a la lista de usuarios, borrar 3 usuarios, comprobar que la lista se actualiza y dichos usuarios desaparecen.
	@Test
	public void PR14() {
		PO_PrivateView.doLogin(driver, "admin@email.com", "admin");
		
		PO_NavView.clickOption(driver, "usuario/list","class","table table-hover");
		
		PO_UserListView.deleteUsers(3, driver);
		
		SeleniumUtils.textoNoPresentePagina(driver, "lucas@email.com");

		SeleniumUtils.textoNoPresentePagina(driver, "maria@email.com");

		SeleniumUtils.textoNoPresentePagina(driver, "pedro@email.com");

		PO_PrivateView.doLogout(driver);			
	}	
	
	//PR15. Ir al formulario de alta de oferta, rellenarla con datos válidos y pulsar el botón Submit. Comprobar que la oferta sale en el listado de ofertas de dicho usuario.
	@Test
	public void PR15() {
		PO_PrivateView.doLogin(driver, "pedro@email.es", "123456");	
		
		PO_PrivateView.fillOfferAddForm(driver, "Zapatillas", "Zapatillas deportivas", "20");
		
		PO_View.checkElement(driver, "text", "Zapatillas");
		
		PO_PrivateView.doLogout(driver);
	}	
	
	//PR16. Ir al formulario de alta de oferta, rellenarla con datos inválidos (campo título vacío y precio en negativo) y pulsar el botón Submit. Comprobar que se muestra el mensaje de campo obligatorio.
	@Test
	public void PR16() {
		PO_PrivateView.doLogin(driver, "pedro@email.es", "123456");	
		
		PO_PrivateView.fillOfferAddForm(driver, " ", "Zapatillas deportivas", "-20");
		
		PO_View.checkElement(driver, "text", "no puede estar va");
		
		PO_View.checkElement(driver, "text", "positivo");
		
		PO_PrivateView.doLogout(driver);		
	}	
	
	//PR017. Mostrar el listado de ofertas para dicho usuario y comprobar que se muestran todas las que existen para este usuario. 
	@Test
	public void PR17() {
		PO_PrivateView.doLogin(driver, "pelayo@email.es", "123456");
		
		PO_NavView.clickMenuOption(driver,"offers-menu","offer/list","class","table table-hover");

		PO_View.checkElement(driver, "text", "Zapatos");
		PO_View.checkElement(driver, "text", "Chaqueta");
		PO_View.checkElement(driver, "text", "Vaqueros");
		
		PO_PrivateView.doLogout(driver);
	}	
	
	//PR18. Ir a la lista de ofertas, borrar la primera oferta de la lista, comprobar que la lista se actualiza y que la oferta desaparece.
	@Test
	public void PR18() {
		PO_PrivateView.doLogin(driver, "pelayo@email.es", "123456");
		
		PO_NavView.clickMenuOption(driver,"offers-menu","offer/list","class","table table-hover");
		
		PO_OfferListView.checkOfferDeleted(driver, 0);
		
		PO_PrivateView.doLogout(driver);			
	}	
	
	//PR19. Ir a la lista de ofertas, borrar la última oferta de la lista, comprobar que la lista se actualiza y que la oferta desaparece.
	@Test
	public void PR19() {
		PO_PrivateView.doLogin(driver, "pelayo@email.es", "123456");
		
		PO_NavView.clickMenuOption(driver,"offers-menu","offer/list","class","table table-hover");
	
		PO_OfferListView.checkLast(driver);
		
		PO_PrivateView.doLogout(driver);			
	}	
	
	//P20. Hacer una búsqueda con el campo vacío y comprobar que se muestra la página que corresponde con el listado de las ofertas existentes en el sistema
	@Test
	public void PR20() {
		PO_PrivateView.doLogin(driver, "pelayo@email.es", "123456");
		
		PO_NavView.searchOffers(driver, "");
		
		PO_View.checkElement(driver, "text", "Coche");
		
		PO_View.checkElement(driver, "text", "Cama");

		PO_PrivateView.doLogout(driver);			
	}	
	
	//PR21. Hacer una búsqueda escribiendo en el campo un texto que no exista y comprobar que se muestra la página que corresponde, con la lista de ofertas vacía.
	@Test
	public void PR21() {
		PO_PrivateView.doLogin(driver, "pelayo@email.es", "123456");
		
		PO_NavView.searchOffers(driver, "haherty");
		
		PO_OfferListView.checkEmptyTable(driver);
		
		PO_PrivateView.doLogout(driver);			
	}	
	
	//PR22. Hacer una búsqueda escribiendo en el campo un texto en minúscula o mayúscula y comprobar que se muestra la página que corresponde, 
	//		con la lista de ofertas que contengan dicho texto, independientemente que el título esté almacenado en minúsculas o mayúscula.
	@Test
	public void PR22() {
		PO_PrivateView.doLogin(driver, "pelayo@email.es", "123456");
		
		PO_NavView.searchOffers(driver, "co");
		
		PO_View.checkElement(driver, "text", "Coche");

		PO_View.checkElement(driver, "text", "Consola");
		
		PO_PrivateView.doLogout(driver);			
	}	
	
	//PR23. Sobre una búsqueda determinada (a elección de desarrollador), comprar una oferta que
	//		deja un saldo positivo en el contador del comprobador. Y comprobar que el contador se
	//		actualiza correctamente en la vista del comprador.
	@Test
	public void PR23() {
		PO_PrivateView.doLogin(driver, "pelayo@email.es", "123456");
		
		PO_NavView.searchOffers(driver, "");
		
		PO_View.checkElement(driver, "text", "100");
		
		PO_OfferListView.buyOffer(driver, "Coche");
		
		PO_View.checkElement(driver, "text", "90");
		
		PO_PrivateView.doLogout(driver);			
	}	
	
	//PR24. Sobre una búsqueda determinada (a elección de desarrollador), comprar una oferta que
	//		deja un saldo 0 en el contador del comprobador. Y comprobar que el contador se actualiza
	//		correctamente en la vista del comprador. 
	@Test
	public void PR24() {
		PO_PrivateView.doLogin(driver, "pelayo@email.es", "123456");
		
		PO_NavView.searchOffers(driver, "oy");
		
		PO_View.checkElement(driver, "text", "100");
		
		PO_OfferListView.buyOffer(driver, "Joya");
		
		PO_View.checkElement(driver, "text", "0");
		
		PO_PrivateView.doLogout(driver);			
	}	
	//PR25. Sobre una búsqueda determinada (a elección de desarrollador), intentar comprar una
	//		oferta que esté por encima de saldo disponible del comprador. Y comprobar que se muestra el
	//		mensaje de saldo no suficiente.
	@Test
	public void PR25() {
		PO_PrivateView.doLogin(driver, "pelayo@email.es", "123456");
		
		PO_NavView.searchOffers(driver, "avi");
		
		PO_OfferListView.buyOffer(driver, "Avion");
		
		PO_View.checkElement(driver, "text", "No dispone de saldo suficiente");
		
		PO_PrivateView.doLogout(driver);			
	}	
	
	//PR26. Ir a la opción de ofertas compradas del usuario y mostrar la lista. Comprobar que
	//		aparecen las ofertas que deben aparecer.
	@Test
	public void PR26() {
		PO_PrivateView.doLogin(driver, "pedro@email.es", "123456");
		
		PO_NavView.clickMenuOption(driver,"offers-menu","compras","class","table table-hover");
		
		PO_View.checkElement(driver, "text", "Chaqueta");
		
		PO_View.checkElement(driver, "text", "Vaqueros");
		
		PO_View.checkElement(driver, "text", "Zapatos");
		
		PO_PrivateView.doLogout(driver);			
	}	
	
	//PR27. Sin hacer /
	@Test
	public void PR27() {
		assertTrue("Requisito no implementado", false);	
	}	
	@Test
	public void PR28() {
		assertTrue("Requisito no implementado", false);		
	}
	//PR029. Sin hacer /
	@Test
	public void PR29() {
		assertTrue("Requisito no implementado", false);		
	}

	//PR030. Inicio de sesión con datos válidos.
	@Test
	public void PR30() {
		PO_ClientView.login(driver, URL,"pelayo@email.es","123456");
		
		PO_View.checkElement(driver, "text", "Titulo");			
	}
	
	//PR031. Inicio de sesión con datos inválidos (email existente, pero contraseña incorrecta).
	@Test
	public void PR31() {
		driver.navigate().to(URL+"/cliente.html");
		
		SeleniumUtils.EsperaCargaPagina(driver, "class", "form-group", PO_View.getTimeout());
		
		PO_ClientView.fillClientLoginForm(driver, "pelayo@email.es","123879");
		
		PO_View.checkElement(driver, "text", "Usuario no encontrado");				
	}
	//PR032. Inicio de sesión con datos válidos (campo email o contraseña vacíos).
	@Test
	public void PR32() {
		driver.navigate().to(URL+"/cliente.html");
		
		SeleniumUtils.EsperaCargaPagina(driver, "class", "form-group", PO_View.getTimeout());
		
		PO_ClientView.fillClientLoginForm(driver, "pelayo@email.es","   ");

		PO_View.checkElement(driver, "text", "Usuario no encontrado");		
	}
	//PR033.	Mostrar el listado de ofertas disponibles y comprobar que se muestran todas las que
	//			existen, menos las del usuario identificado.
	@Test
	public void PR33() {
		PO_ClientView.login(driver, URL,"pelayo@email.es","123456");
		
		PO_View.checkElement(driver, "text", "Coche");			
		PO_View.checkElement(driver, "text", "Cama");			
		PO_View.checkElement(driver, "text", "Consola");			
		PO_View.checkElement(driver, "text", "Joya");			
		PO_View.checkElement(driver, "text", "Avion");				
	}
	//PR034. Sobre una búsqueda determinada de ofertas (a elección de desarrollador), enviar un
	//		 mensaje a una oferta concreta. Se abriría dicha conversación por primera vez. Comprobar que el
	// 		 mensaje aparece en el listado de mensajes.
	@Test
	public void PR34() {
		PO_ClientView.login(driver, URL,"pelayo@email.es","123456");
		
		PO_View.checkElement(driver, "text", "Coche");
		
		driver.findElement(By.xpath("//a[contains(text(),'pedro@email.es')]")).click();
		
		PO_View.checkElement(driver, "text", "Mensaje");
		
		PO_ClientView.sendMessage(driver, "Buenas tardes.");
		
		PO_View.checkElement(driver, "text", "Buenas");
	}
	
	//PR035. Sobre el listado de conversaciones enviar un mensaje a una conversación ya abierta.
	//		 Comprobar que el mensaje aparece en el listado de mensajes.
	@Test
	public void PR35() {
		PO_ClientView.login(driver, URL,"pedro@email.es","123456");
		
		PO_View.checkElement(driver, "text", "Zapatos");
		
		driver.findElement(By.xpath("//a[contains(text(),'Conversaciones')]")).click();
		
		PO_View.checkElement(driver, "text", "Vendedor");
		
		PO_View.checkElement(driver, "text", "Zapatos");
		
		PO_ConversationView.openChat(driver, "Zapatos");
		
		PO_View.checkElement(driver, "text", "Mensaje");
		
		PO_ClientView.sendMessage(driver, "Me rebajas el precio?");
		
		PO_View.checkElement(driver, "text", "rebajas");
		
	}	
	//PR036. Mostrar el listado de conversaciones ya abiertas. Comprobar que el listado contiene las
	//		 conversaciones que deben ser.
	@Test
	public void PR36() {
		PO_ClientView.login(driver, URL,"pedro@email.es","123456");
		
		PO_View.checkElement(driver, "text", "Zapatos");
		
		driver.findElement(By.xpath("//a[contains(text(),'Conversaciones')]")).click();
		
		PO_View.checkElement(driver, "text", "Vendedor");
		
		PO_View.checkElement(driver, "text", "Zapatos");
		
		PO_View.checkElement(driver, "text", "Coche");
		
		PO_View.checkElement(driver, "text", "Vaqueros");
		
		PO_View.checkElement(driver, "text", "Chaqueta");
	}	
	//PR037. Sobre el listado de conversaciones ya abiertas. Pinchar el enlace Eliminar de la primera y
	//	 	 comprobar que el listado se actualiza correctamente.
	@Test
	public void PR37() {
		PO_ClientView.login(driver, URL,"pedro@email.es","123456");
		
		PO_View.checkElement(driver, "text", "Zapatos");
		
		driver.findElement(By.xpath("//a[contains(text(),'Conversaciones')]")).click();
		
		PO_View.checkElement(driver, "text", "Vendedor");
		
		PO_View.checkElement(driver, "text", "Zapatos");
		
		PO_ConversationView.checkConversationDeleted(driver, 0);
	}
	
	//PR038. Sobre el listado de conversaciones ya abiertas. Pinchar el enlace Eliminar de la última y
	//		 comprobar que el listado se actualiza correctamente.
	@Test
	public void PR38() {
		PO_ClientView.login(driver, URL,"pedro@email.es","123456");
		
		PO_View.checkElement(driver, "text", "Zapatos");
		
		driver.findElement(By.xpath("//a[contains(text(),'Conversaciones')]")).click();
		
		PO_View.checkElement(driver, "text", "Vendedor");
		
		PO_View.checkElement(driver, "text", "Zapatos");
		
		PO_ConversationView.checkLast(driver);
	}
	//PR039. Identificarse en la aplicación y enviar un mensaje a una oferta, validar que el mensaje
	//		 enviado aparece en el chat. Identificarse después con el usuario propietario de la oferta y validar
	//		 que tiene un mensaje sin leer, entrar en el chat y comprobar que el mensaje pasa a tener el estado leído.
	@Test
	public void PR39() {
		PO_ClientView.enterChat(driver, "Zapatos","pedro@email.es","Zapatos",URL);
		
		PO_ClientView.sendMessage(driver, "Me rebajas el precio?");
		
		PO_View.checkElement(driver, "text", "rebajas");
		
		PO_ClientView.enterChat(driver, "Zapatos","pelayo@email.es","Coche",URL);
		
		PO_View.checkElement(driver, "text", "rebajas");
		
		PO_ClientView.enterChat(driver, "Zapatos","pedro@email.es","Zapatos",URL);
		
		PO_View.checkElement(driver, "text", "leido");
	}	
}

