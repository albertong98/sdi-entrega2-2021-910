package com.uniovi.tests.util;

import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public class PasswordEncrypter {
	public static String encrypt(String password) {
		String result ="";
		try {
			SecretKeySpec keySpec = new SecretKeySpec( "abcdefg".getBytes(),"HmacSHA256");
		    Mac mac = Mac.getInstance("HmacSHA256");
			mac.init(keySpec);
			
			byte[] hash = mac.doFinal(password.getBytes(StandardCharsets.UTF_8));
			result = toHexString(hash);
		} catch (NoSuchAlgorithmException e) {
			e.printStackTrace();
		}catch (InvalidKeyException e) {
			e.printStackTrace();
		}
		return result;
	}

	public static String toHexString(byte hash[]) {
		StringBuilder hexString = new StringBuilder();
	    for (int i = 0; i < hash.length; i++) {
	        String hex = Integer.toHexString(0xff & hash[i]);
	        if(hex.length() == 1) {
	            hexString.append('0');
	        }
	        hexString.append(hex);
	    }
	    return hexString.toString();
	}
}
