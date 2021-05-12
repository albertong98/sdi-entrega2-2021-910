package com.uniovi.tests.pageobjects;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import com.uniovi.tests.util.SeleniumUtils;

public class PO_ClientView extends PO_NavView {
	public static void login(WebDriver driver,String URL,String userEmail,String password) {
		driver.navigate().to(URL+"/cliente.html");
		
		SeleniumUtils.EsperaCargaPagina(driver, "class", "form-group", PO_View.getTimeout());
		
		fillClientLoginForm(driver, userEmail,password);
		
		SeleniumUtils.EsperaCargaPagina(driver, "class", "table table-hover", PO_View.getTimeout());
	}
	
	static public void fillClientLoginForm(WebDriver driver, String emailp, String passwordp) {
		WebElement email = driver.findElement(By.name("email"));
		email.click();
		email.clear();
		email.sendKeys(emailp);
		WebElement password = driver.findElement(By.name("password"));
		password.click();
		password.clear();
		password.sendKeys(passwordp);
		//Pulsar el boton de Alta.
		By boton = By.id("boton-login");
		driver.findElement(boton).click();	
	}
	
	private static void fillForm(WebDriver driver,String fieldName,String content,String idBoton) {
		WebElement searchText = driver.findElement(By.id(fieldName));
		searchText.click();
		searchText.clear();
		searchText.sendKeys(content);
		
		By boton = By.id(idBoton);
		driver.findElement(boton).click();
	}
	
	public static void sendMessage(WebDriver driver,String mensaje) {
		fillForm(driver,"mensaje",mensaje,"boton-enviar");
	}
	
	public static void enterChat(WebDriver driver,String articulo,String email,String texto,String URL) {
		login(driver, URL,email,"123456");
		
		PO_View.checkElement(driver, "text", texto);
		
		driver.findElement(By.xpath("//a[contains(text(),'Conversaciones')]")).click();
		
		PO_View.checkElement(driver, "text", "Vendedor");
		
		PO_View.checkElement(driver, "text",  articulo);
		
		PO_ConversationView.openChat(driver,  articulo);
		
		PO_View.checkElement(driver, "text", "Mensaje");
	}
}
