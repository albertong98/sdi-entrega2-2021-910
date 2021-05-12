package com.uniovi.tests.pageobjects;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;


public class PO_PrivateView extends PO_NavView{
	public static void fillOfferAddForm(WebDriver driver, String titulop,  String descripcionp, String preciop) {
		WebElement  titulo = driver.findElement(By.name("title"));
		titulo.click();
		titulo.clear();
		titulo.sendKeys(titulop);
		WebElement descripcion = driver.findElement(By.name("details"));
		descripcion.click();
		descripcion.clear();
		descripcion.sendKeys(descripcionp);
		WebElement precio = driver.findElement(By.name("price"));
		precio.click();
		precio.clear();
		precio.sendKeys(preciop);
		By boton = By.id("send");
		driver.findElement(boton).click();
	}
	
	public static void doSignup(WebDriver driver, String email,String name,String surname,String password,String passwordConfirm) {
		PO_NavView.clickOption(driver, "registrarse","class", "btn btn-primary");
		
		PO_RegisterView.fillForm(driver, email, name, surname, password, passwordConfirm);
	}
	
	public static void doLogin(WebDriver driver, String email,String password) {
		PO_NavView.clickOption(driver, "identificarse","class", "btn btn-primary");
		
		PO_LoginView.fillForm(driver, email, password);
	}
	
	public static void doLogout(WebDriver driver) {
		PO_PrivateView.clickOption(driver, "desconectarse", "class", "btn btn-primary");
	}
	
	public static void addOffer(WebDriver driver,String URL,String user,String password, String titulop,  String descripcionp, String preciop) {
		doLogin(driver,user,password);
		driver.navigate().to(URL+"/offer/add");
		fillOfferAddForm(driver,titulop,descripcionp,preciop);
	}
}