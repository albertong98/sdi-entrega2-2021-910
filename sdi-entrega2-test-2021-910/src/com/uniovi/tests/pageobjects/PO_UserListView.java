package com.uniovi.tests.pageobjects;

import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import com.uniovi.tests.util.SeleniumUtils;

public class PO_UserListView extends PO_NavView{
	public static void deleteUsers(int users,WebDriver driver) {
		List<WebElement> elementos = driver.findElements(By.xpath("//input[contains(@type,'checkbox')]"));
		for(int i=0;i<users;i++) 
			elementos.get(i).click();
		
		driver.findElement(By.name("delete")).click();
	}
	
	public static void deleteLast(WebDriver driver) {
		//Se obtiene el email del último usuario
		List<WebElement> elementos = PO_View.checkElement(driver, "free","//td");
		String texto = elementos.get((PO_View.checkElement(driver, "free","//tr").size()-2)*4).getText();
		//Se selecciona el checkbox
		elementos = driver.findElements(By.xpath("//input[contains(@type,'checkbox')]"));
		elementos.get(elementos.size()-1).click();
		//Se pulsa el botón borrar
		driver.findElement(By.name("delete")).click();
		
		PO_View.checkElementNotInPage(driver, texto);
	}
}
